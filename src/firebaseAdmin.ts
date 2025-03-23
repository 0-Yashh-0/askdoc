import * as admin from 'firebase-admin';
import {getFirestore} from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';

import { App, getApp, getApps } from 'firebase-admin/app';
const serviceKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

let app : App;
    if(getApps().length === 0){
        app = admin.initializeApp({
        credential: admin.credential.cert(serviceKey as ServiceAccount),
    });
} else {
    app = getApp();
}

const adminDb = getFirestore(app);

export {app as adminApp, adminDb};