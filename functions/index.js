
const admin = require("firebase-admin");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");

// Initialize default app (PROD project)
admin.initializeApp();

// Initialize BACKUP app with its service account
const backupApp = initializeApp({
  credential: admin.credential.cert(
      require("./collegedb_preview.json"),
  ),
}, "backup");

const backupDb = getFirestore(backupApp);

// Generic sync function for any collection
const createSyncFunction = (collectionName) => {
  return onDocumentWritten(`${collectionName}/{docId}`, async (event) => {
    const docId = event.params.docId;
    const change = event.data;
    const backupRef = backupDb.collection(collectionName).doc(docId);

    if (!change.after.exists) {
      // Deleted in PROD → delete in BACKUP
      await backupRef.delete();
      console.log(`Deleted ${collectionName}/${docId} from backup`);
    } else {
      // Created or updated in PROD → upsert in BACKUP
      await backupRef.set(change.after.data(), {
        merge: true,
      });
      console.log(`Synced ${collectionName}/${docId} to backup`);
    }
  });
};

// Export sync functions for all collections
exports.syncAdmins = createSyncFunction("admins");
exports.syncAppointments = createSyncFunction("appointments");
exports.syncChats = createSyncFunction("chats");
exports.syncColleges = createSyncFunction("colleges");
exports.syncCounsellors = createSyncFunction("counsellors");
exports.syncCourseTypes = createSyncFunction("courseTypes");
exports.syncCourses = createSyncFunction("courses");
exports.syncExams = createSyncFunction("exams");
exports.syncNews = createSyncFunction("news");
exports.syncReviews = createSyncFunction("reviews");
exports.syncStates = createSyncFunction("states");
exports.syncTrendingCourses = createSyncFunction("trendingCourses");
exports.syncUsers = createSyncFunction("users");
