const admin = require("firebase-admin");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");

// Initialize default app (PROD project)
admin.initializeApp();

// Initialize BACKUP app with its service account
const backupApp = initializeApp(
    {
      credential: admin.credential.cert(
          require("./collegedb_preview.json"),
      ),
    },
    "backup",
);

const backupDb = getFirestore(backupApp);

// Generic sync function for any collection
const createSyncFunction = (collectionName) => {
  return onDocumentWritten(`${collectionName}/{docId}`, async (event) => {
    const docId = event.params.docId;
    const change = event.data;
    const backupRef = backupDb.collection(collectionName).doc(docId);

    if (change.after.exists) {
      try {
        await backupRef.set(change.after.data(), {merge: true});

        if (!change.before.exists) {
          console.log(`Created ${collectionName}/${docId} in backup`);
        } else {
          console.log(`Updated ${collectionName}/${docId} in backup`);
        }
      } catch (err) {
        console.error(
            `Failed to sync ${collectionName}/${docId}:`,
            err.message || err,
        );
      }
    } else {
      // Ignore deletions
      console.log(`Ignored deletion of ${collectionName}/${docId}`);
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
exports.syncBecomeCounselPts = createSyncFunction("becomeCounsellorPoints");
exports.syncClients = createSyncFunction("clients");
exports.syncComingEvents = createSyncFunction("comingEvents");
exports.synccounsellorAct = createSyncFunction("counsellorActivityLogs");
exports.syncCounsellorApp = createSyncFunction("counsellorAppointments");
exports.syncCounsellorBusin = createSyncFunction("counsellorBusinessDetails");
exports.syncCounsellorChats = createSyncFunction("counsellorChats");
exports.syncCounsellorReview = createSyncFunction("counsellorReview");
exports.syncCounsellorTran = createSyncFunction("counsellorTransactions");
exports.syncDeleted_counsellors = createSyncFunction("deleted_counsellors");
exports.syncEngineering_plans = createSyncFunction("engineering_plans");
exports.syncEvents = createSyncFunction("events");
exports.syncMba_plans = createSyncFunction("mba_plans");
exports.syncOthers_plans = createSyncFunction("others_plans");
exports.syncOutOfOffice = createSyncFunction("outOfOffice");
exports.syncPlans = createSyncFunction("plans");
exports.syncStates = createSyncFunction("states");
exports.syncSubscriptions = createSyncFunction("subscriptions");
exports.syncUserActivityLogs = createSyncFunction("userActivityLogs");
exports.syncUserAppointments = createSyncFunction("userAppointments");
exports.syncUserChats = createSyncFunction("userChats");
exports.syncUserFavouriteCou = createSyncFunction("userFavouriteCounsellors");
exports.syncUserReview = createSyncFunction("userReview");
exports.syncUserSubscribed = createSyncFunction("userSubscribedCounsellors");
exports.syncUserTransactions = createSyncFunction("userTransactions");
