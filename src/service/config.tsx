import { Platform } from "react-native";
const devMode = false;
// export const BASE_URL = 'http://localhost:3000'
// //   // Platform.OS === "ios" ? "http://localhost:3000" : "http://10.0.2.2:3000";
//   Platform.OS === "ios" ? "http://localhost:3000" : "http://localhost:3000";
//   export const SOCKET_URL = Platform.OS === 'ios' ?
//    'ws://localhost:3000' :
//     "ws://localhost:3000";
//    'ws://10.0.2.2:3000';

  //  use your network or ip address or hosted url  IPV4 address

   export const BASE_URL = devMode 
   ?'http:// 192.168.109.73:3000':'https://ride-backend-twso.onrender.com';
  // export const BASE_URL = 'http://localhost:3000'
  // export const BASE_URL = 'http:// 192.168.109.73:3000'
  //  export const SOCKET_URL = Platform.OS === 'ios' ?
  //  'ws:// 192.168.109.73:3000':' http://10.0.2.2:3000' ;

  export const SOCKET_URL = devMode
  ? (Platform.OS === 'ios' ? 'ws://192.168.109.73:3000' : 'ws://10.0.2.2:3000')
  : 'wss://ride-backend-twso.onrender.com';