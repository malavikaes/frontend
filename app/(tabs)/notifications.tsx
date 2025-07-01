import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BACKEND_BASE_URL } from '../../constants/Backend';
import { useUnreadNotifications } from '../../components/UnreadNotificationsContext';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../_layout';

const PAGE_SIZE = 10;

type Notification = {
  ID: number;
  NOTI_TEXT: string;
  STATUS: 'SUCCESS' | 'FAILURE';
  CREATED_AT: string;
  SEEN: number;
  DELETED: number;
  NOTIFICATION_TYPE: string;
  NOTIFICATION_PRIORITY: number;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unreadIds, setUnreadIds] = useState<number[]>([]);
  const { setUnread } = useUnreadNotifications();
  const { user } = useContext(AuthContext);

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      // Add user_id parameter to filter by current user
      const userId = user?.empid;
      console.log('🔍 Fetching notifications for user ID:', userId);
      console.log('🔍 Full user object:', user);
      
      const url = userId 
        ? `${BACKEND_BASE_URL}/notifications?page=${pageNum}&limit=${PAGE_SIZE}&user_id=${userId}`
        : `${BACKEND_BASE_URL}/notifications?page=${pageNum}&limit=${PAGE_SIZE}`;
      
      console.log('🔍 Fetching from URL:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      console.log('🔍 Response data:', data);
      
      setNotifications(data.notifications || []);
      setTotalPages(Math.max(1, Math.ceil((data.total || (data.notifications?.length ?? 0)) / PAGE_SIZE)));
      // Mark all as unread on first load
      const newUnreadIds = (data.notifications || []).map((n: Notification) => n.ID);
      setUnreadIds(newUnreadIds);
      setUnread(newUnreadIds.length > 0);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Notifications component mounted, user:', user);
    fetchNotifications(page);
  }, [page, user?.empid]); // Also depend on user.empid to refetch when user changes

  // Mark all as read when page is focused
  useFocusEffect(
    React.useCallback(() => {
      setUnread(false);
      setUnreadIds([]);
    }, [setUnread])
  );

  const handleDelete = async (id: number) => {
    try {
      const userId = user?.empid;
      const url = userId 
        ? `${BACKEND_BASE_URL}/notification/${id}?user_id=${userId}`
        : `${BACKEND_BASE_URL}/notification/${id}`;
      
      await fetch(url, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.ID !== id));
      setUnreadIds(unreadIds.filter(unreadId => unreadId !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const markAsRead = (id: number) => {
    setUnreadIds(unreadIds.filter(unreadId => unreadId !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => (item.ID ? item.ID.toString() : index.toString())}
          renderItem={({ item }: { item: Notification }) => {
            // Normalize status for color logic
            const status = (item.STATUS || '').toString().toLowerCase();
            const isSuccess = status === 'success' || item.NOTI_TEXT.toLowerCase().includes('clicked submit button');
            const isFailure = status === 'failure' && !isSuccess;

            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  isSuccess ? styles.greenOutline : styles.redOutline,
                  unreadIds.includes(item.ID) && styles.unread
                ]}
                onPress={() => markAsRead(item.ID)}
              >
                {isSuccess && (
                  <Text style={{ fontWeight: 'bold', color: 'green', marginBottom: 4 }}>Successful Submission</Text>
                )}
                {isFailure && (
                  <Text style={{ fontWeight: 'bold', color: 'red', marginBottom: 4 }}>Failed Submission</Text>
                )}
                <Text style={styles.result}>{item.NOTI_TEXT}</Text>
                <Text style={styles.timestamp}>{new Date(item.CREATED_AT).toLocaleString()}</Text>
                <TouchableOpacity onPress={async () => {
                  // Remove from UI immediately
                  setNotifications(notifications.filter(n => n.ID !== item.ID));
                  try {
                    await handleDelete(item.ID);
                  } catch {}
                }} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No notifications.</Text>}
        />
      )}
      <View style={styles.pagination}>
        <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)}>
          <Text style={[styles.arrow, page === 1 && styles.disabledArrow]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.pageNum}>{page} / {totalPages}</Text>
        <TouchableOpacity disabled={page === totalPages} onPress={() => setPage(page + 1)}>
          <Text style={[styles.arrow, page === totalPages && styles.disabledArrow]}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  greenOutline: { borderColor: 'green' },
  redOutline: { borderColor: 'red' },
  result: { fontSize: 16, fontWeight: '500' },
  timestamp: { fontSize: 12, color: '#888', marginTop: 4 },
  deleteBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
  deleteText: { color: 'red', fontWeight: 'bold' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  arrow: { fontSize: 24, marginHorizontal: 20, color: '#333' },
  disabledArrow: { color: '#ccc' },
  pageNum: { fontSize: 16, fontWeight: 'bold' },
  unread: { backgroundColor: '#e0e0e0' },
});

// Expose a function to add a notification immediately (for use after actions)
export function useAddNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  return (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };
} 