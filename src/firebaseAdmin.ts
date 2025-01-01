import * as admin from 'firebase-admin';
import {getFirestore} from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';

import serviceKey from '../service_key.json';
import { App, getApp, getApps } from 'firebase-admin/app';


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