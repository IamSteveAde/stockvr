import { Redis} from "ioredis"
import { SECRETS } from "../util/secrets";

export const redis = new Redis({
  username: SECRETS.REDIS_USERNAME,
  password: SECRETS.REDIS_PASSWORD,
  host: SECRETS.REDIS_HOST,
  port: SECRETS.REDIS_PORT,
  tls: SECRETS.REDIS_TLS,
  maxRetriesPerRequest: null,
});


export const SCOPE_KEY = {
    business: (uid: string)=>{
        return "business:"+ uid 
    },

    startShiftEntry: (businessUid: string, shiftId: string)=>{
        return `start-shift-entry:${businessUid}:${shiftId}`
    },

    endShiftEntry: (businessUid: string, shiftId: string)=>{
        return `end-shift-entry:${businessUid}:${shiftId}`
    }
}
