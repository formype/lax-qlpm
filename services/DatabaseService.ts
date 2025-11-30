
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot, 
  query, 
  where,
  orderBy,
  getDocs,
  getDoc,
  writeBatch,
  Firestore,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { MachineRecord, MachineStatus, MachineLog, MachineHistoryEntry, User, GlobalSettings, AppVersionConfig } from '../types';

// --- CẤU HÌNH FIREBASE PROJECT: lax-tinhoc ---
const firebaseConfig = {
  apiKey: "AIzaSyALQ2nI6hp0B-yDQrLSVl4CWbpKUb_OeIk",
  authDomain: "lax-tinhoc.firebaseapp.com",
  projectId: "lax-tinhoc",
  storageBucket: "lax-tinhoc.firebasestorage.app",
  messagingSenderId: "570438387634",
  appId: "1:570438387634:web:ba1fefde734838e91e46ab",
  measurementId: "G-479KS3NFE3"
};

const MACHINE_COLLECTION = 'machines';
const HISTORY_SUB_COLLECTION = 'history';
const USER_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'settings';
const GLOBAL_SETTINGS_DOC = 'global';
const APP_VERSION_DOC = 'app_version';

const LOCAL_STORAGE_KEY = 'lax_qlpm_data';
const LOCAL_STORAGE_HISTORY_KEY = 'lax_qlpm_history';

const LAB_CONFIGS = [
  { id: 'lab-1', count: 45 },
  { id: 'lab-3', count: 40 }
];

class DatabaseService {
  private firestore: Firestore | null = null;
  private isFallback = false;

  constructor() {
    try {
      // Basic validation to detect placeholder config
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('EXAMPLE')) {
        throw new Error("Missing or invalid Firebase Configuration");
      }
      
      const app = initializeApp(firebaseConfig);
      this.firestore = getFirestore(app);
      console.log("✅ Successfully connected to Firebase Firestore:", firebaseConfig.projectId);
    } catch (error: any) {
      console.warn("Firebase initialization failed. Switching to LocalStorage Fallback.", error);
      this.isFallback = true;
      
      // Alert user if it's a real connection error (not just missing config)
      if (!error.message?.includes("Missing or invalid Firebase Configuration")) {
          setTimeout(() => {
              alert(`⚠️ KHÔNG THỂ KẾT NỐI FIREBASE!\n\nChi tiết lỗi: ${error.message}\n\nỨng dụng sẽ chuyển sang chế độ OFFLINE (Lưu trên máy này).`);
          }, 1000);
      }
    }
  }
  
  // --- HELPER FOR FALLBACK ---
  private getLocalData(): MachineRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private saveLocalData(data: MachineRecord[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    // Dispatch event for same-tab updates
    window.dispatchEvent(new Event('local-db-update'));
  }

  // Get History from LocalStorage
  private getLocalHistory(): Record<string, MachineHistoryEntry[]> {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  private saveLocalHistory(machineId: string, entry: MachineHistoryEntry) {
    const allHistory = this.getLocalHistory();
    if (!allHistory[machineId]) {
      allHistory[machineId] = [];
    }
    // Add to beginning
    allHistory[machineId].unshift(entry);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(allHistory));
    window.dispatchEvent(new Event(`local-history-update-${machineId}`));
  }

  // --- PUBLIC API ---

  public isUsingFirebase(): boolean {
    return !this.isFallback;
  }

  // --- AUTHENTICATION ---
  
  public async login(username: string, password: string): Promise<User> {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (this.isFallback) {
      // Mock login for offline mode
      if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
        return { username: 'admin', fullName: 'Admin Offline', role: 'Administrator' };
      }
      if (cleanUsername === 'admin' && cleanPassword === '123') {
         return { username: 'admin', fullName: 'Admin Offline', role: 'Administrator', isDefaultPassword: true };
      }
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng (Offline Mode)");
    }

    if (!this.firestore) throw new Error("Database not initialized");

    try {
      // --- SMART BOOTSTRAP LOGIC ---
      if (cleanUsername === 'admin' && cleanPassword === '123') {
         const usersRef = collection(this.firestore, USER_COLLECTION);
         const snapshot = await getDocs(query(usersRef, limit(1)));
         
         if (snapshot.empty) {
            console.log("⚠️ Database empty. Creating bootstrap Admin account...");
            const newAdmin: User = {
                username: 'admin',
                password: '123',
                fullName: 'Administrator',
                role: 'Administrator',
                isDefaultPassword: true
            };
            await setDoc(doc(this.firestore, USER_COLLECTION, 'admin'), newAdmin);
            return newAdmin;
         }
      }
      // -----------------------------

      const usersRef = collection(this.firestore, USER_COLLECTION);
      
      // Check if the user exists
      const q = query(usersRef, where("username", "==", cleanUsername));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // User exists, check password
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data() as User;

        if (userData.password !== cleanPassword) {
          throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        const isDefaultPassword = cleanPassword === '123';
        return {
          id: userDoc.id,
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role,
          isDefaultPassword
        };
      } 
      
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");

    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  public async changePassword(userId: string, newPassword: string): Promise<void> {
    if (this.isFallback) throw new Error("Offline mode");
    if (!this.firestore) throw new Error("DB not init");

    try {
      const userRef = doc(this.firestore, USER_COLLECTION, userId);
      await setDoc(userRef, { password: newPassword }, { merge: true });
      console.log(`✅ Password updated for user: ${userId}`);
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("Lỗi khi cập nhật mật khẩu. Vui lòng thử lại.");
    }
  }

  // --- USER MANAGEMENT ---
  
  public async getUsers(): Promise<User[]> {
    if (this.isFallback) return [];
    if (!this.firestore) return [];
    
    try {
      const q = query(collection(this.firestore, USER_COLLECTION));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  public async createUser(user: User): Promise<void> {
    if (this.isFallback) throw new Error("Offline");
    if (!this.firestore) throw new Error("DB not init");

    const userDocRef = doc(this.firestore, USER_COLLECTION, user.username);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) throw new Error("Tên đăng nhập đã tồn tại");

    await setDoc(userDocRef, {
        username: user.username,
        password: user.password,
        fullName: user.fullName,
        role: user.role
    });
  }

  public async updateUser(userId: string, data: { fullName: string; role: string }): Promise<void> {
    if (this.isFallback) throw new Error("Offline mode");
    if (!this.firestore) throw new Error("DB not init");
    
    const docRef = doc(this.firestore, USER_COLLECTION, userId);
    await updateDoc(docRef, data);
  }

  public async deleteUser(username: string): Promise<void> {
    if (this.isFallback) throw new Error("Offline mode");
    if (!this.firestore) throw new Error("DB not init");
    
    console.log(`Attempting to delete user with username: ${username}`);
    
    try {
        const q = query(collection(this.firestore, USER_COLLECTION), where("username", "==", username));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
           throw new Error("Không tìm thấy người dùng");
        }

        const docToDelete = snapshot.docs[0];
        await deleteDoc(docToDelete.ref);
        console.log(`✅ User ${username} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
  }

  public async resetUserPassword(userId: string): Promise<void> {
    await this.changePassword(userId, '123');
  }

  // --- SETTINGS MANAGEMENT (THEME & VERSION) ---

  public async updateGlobalTheme(themeId: string, updatedBy: string): Promise<void> {
    if (this.isFallback) {
      localStorage.setItem('lax_global_theme', themeId);
      window.dispatchEvent(new Event('local-settings-update'));
      return;
    }
    if (!this.firestore) return;

    try {
      const settingsRef = doc(this.firestore, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
      await setDoc(settingsRef, {
        themeId,
        updatedBy,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating theme:", error);
      throw error;
    }
  }

  public subscribeToGlobalSettings(onUpdate: (settings: GlobalSettings) => void) {
    if (this.isFallback) {
      const handleLocal = () => {
        const theme = localStorage.getItem('lax_global_theme') || 'default';
        onUpdate({ themeId: theme });
      };
      handleLocal();
      window.addEventListener('local-settings-update', handleLocal);
      return () => window.removeEventListener('local-settings-update', handleLocal);
    }
    if (!this.firestore) return () => {};

    const settingsRef = doc(this.firestore, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    return onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        onUpdate(doc.data() as GlobalSettings);
      } else {
        // Default if not set
        onUpdate({ themeId: 'default' });
      }
    });
  }

  public async getAppVersion(): Promise<AppVersionConfig | null> {
    if (this.isFallback) return null;
    if (!this.firestore) return null;

    try {
      const docRef = doc(this.firestore, SETTINGS_COLLECTION, APP_VERSION_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as AppVersionConfig;
      }
      return null;
    } catch (error) {
      console.error("Error fetching version:", error);
      return null;
    }
  }

  public async updateAppVersion(version: string, downloadUrl: string, updatedBy: string): Promise<void> {
     if (this.isFallback) throw new Error("Offline mode");
     if (!this.firestore) throw new Error("DB not init");

     try {
       const docRef = doc(this.firestore, SETTINGS_COLLECTION, APP_VERSION_DOC);
       await setDoc(docRef, {
         version,
         downloadUrl,
         updatedBy,
         updatedAt: serverTimestamp()
       }, { merge: true });
     } catch (error) {
       console.error("Error updating version:", error);
       throw error;
     }
  }

  // --- DATA MANAGEMENT ---

  public async checkAndSeedData() {
    if (this.isFallback) {
      const currentData = this.getLocalData();
      if (currentData.length === 0) {
        const newData: MachineRecord[] = [];
        LAB_CONFIGS.forEach(lab => {
          // Start from 0 to include Teacher machine (0) and Students (1..count)
          for (let i = 0; i <= lab.count; i++) {
            newData.push({
              id: `${lab.id}_${i}`,
              labId: lab.id,
              machineNumber: i,
              status: MachineStatus.ONLINE
            });
          }
        });
        this.saveLocalData(newData);
      }
      return;
    }

    if (!this.firestore) return;

    try {
        const testDocRef = doc(this.firestore, MACHINE_COLLECTION, '_test_permission');
        await setDoc(testDocRef, { test: true, timestamp: serverTimestamp() });
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            alert("⚠️ LỖI QUYỀN TRUY CẬP FIREBASE!\nVui lòng sửa Rules thành: allow read, write: if true;");
        }
        return; 
    }

    try {
      const q = query(collection(this.firestore, MACHINE_COLLECTION), where("labId", "==", "lab-1"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const batch = writeBatch(this.firestore);

        LAB_CONFIGS.forEach(lab => {
          // Start from 0 to include Teacher machine (0) and Students (1..count)
          for (let i = 0; i <= lab.count; i++) {
            const docId = `${lab.id}_${i}`;
            const docRef = doc(this.firestore!, MACHINE_COLLECTION, docId);
            const newRecord: MachineRecord = {
              id: docId,
              labId: lab.id,
              machineNumber: i,
              status: MachineStatus.ONLINE,
              updatedAt: serverTimestamp()
            };
            batch.set(docRef, newRecord);
          }
        });

        await batch.commit();
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }

  public subscribeToAllMachines(onUpdate: (machines: MachineRecord[]) => void) {
    if (this.isFallback) {
      const handleLocalUpdate = () => {
        const allData = this.getLocalData();
        onUpdate(allData);
      };
      handleLocalUpdate();
      window.addEventListener('local-db-update', handleLocalUpdate);
      return () => window.removeEventListener('local-db-update', handleLocalUpdate);
    }

    if (!this.firestore) return () => {};
    
    const q = collection(this.firestore, MACHINE_COLLECTION);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const machines: MachineRecord[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== '_test_permission') {
            machines.push(doc.data() as MachineRecord);
        }
      });
      machines.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(machines);
    }, (error) => console.error(error));

    return unsubscribe;
  }

  public subscribeToLab(labId: string, onUpdate: (machines: MachineRecord[]) => void) {
    if (this.isFallback) {
      const handleLocalUpdate = () => {
        const allData = this.getLocalData();
        const labData = allData.filter(m => m.labId === labId);
        labData.sort((a, b) => a.machineNumber - b.machineNumber);
        onUpdate(labData);
      };
      handleLocalUpdate();
      window.addEventListener('local-db-update', handleLocalUpdate);
      return () => window.removeEventListener('local-db-update', handleLocalUpdate);
    }

    if (!this.firestore) return () => {};
    
    const q = query(collection(this.firestore, MACHINE_COLLECTION), where("labId", "==", labId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const machines: MachineRecord[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== '_test_permission') {
            machines.push(doc.data() as MachineRecord);
        }
      });
      machines.sort((a, b) => a.machineNumber - b.machineNumber);
      onUpdate(machines);
    }, (error) => console.error(error));

    return unsubscribe;
  }

  public subscribeToMachineHistory(labId: string, machineNumber: number, onUpdate: (history: MachineHistoryEntry[]) => void) {
    const docId = `${labId}_${machineNumber}`;

    if (this.isFallback) {
      const handleHistoryUpdate = () => {
        const allHistory = this.getLocalHistory();
        const machineHistory = allHistory[docId] || [];
        onUpdate(machineHistory);
      };
      handleHistoryUpdate();
      window.addEventListener(`local-history-update-${docId}`, handleHistoryUpdate);
      return () => window.removeEventListener(`local-history-update-${docId}`, handleHistoryUpdate);
    }

    if (!this.firestore) return () => {};

    const historyRef = collection(this.firestore, MACHINE_COLLECTION, docId, HISTORY_SUB_COLLECTION);
    const q = query(historyRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData: MachineHistoryEntry[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        historyData.push({
          id: doc.id,
          status: d.status,
          issues: d.issues,
          note: d.note,
          updatedBy: d.updatedBy,
          timestamp: d.timestamp,
          formattedDate: d.formattedDate
        });
      });
      onUpdate(historyData);
    });

    return unsubscribe;
  }

  public async updateMachine(labId: string, machineNumber: number, status: MachineStatus, log: MachineLog) {
    const docId = `${labId}_${machineNumber}`;

    if (this.isFallback) {
      const allData = this.getLocalData();
      const index = allData.findIndex(m => m.labId === labId && m.machineNumber === machineNumber);
      
      if (index !== -1) {
        allData[index] = { ...allData[index], status, log };
        this.saveLocalData(allData);
        this.saveLocalHistory(docId, {
          status,
          issues: log.issues,
          note: log.note,
          updatedBy: log.updatedBy,
          timestamp: new Date().toISOString(),
          formattedDate: log.lastUpdated
        });
      }
      return;
    }

    if (!this.firestore) return;
    const docRef = doc(this.firestore, MACHINE_COLLECTION, docId);
    try {
      const batch = writeBatch(this.firestore);
      batch.set(docRef, {
        id: docId,
        labId,
        machineNumber,
        status,
        log,
        updatedAt: serverTimestamp() 
      }, { merge: true });

      const historyRef = doc(collection(this.firestore, MACHINE_COLLECTION, docId, HISTORY_SUB_COLLECTION));
      batch.set(historyRef, {
        status,
        issues: log.issues,
        note: log.note,
        updatedBy: log.updatedBy,
        timestamp: serverTimestamp(),
        formattedDate: log.lastUpdated
      });
      await batch.commit();
      console.log(`✅ Đã lưu thành công vào Firestore: ${docId}`);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("❌ Lỗi lưu dữ liệu lên Cloud.");
    }
  }
}

export const db = new DatabaseService();
