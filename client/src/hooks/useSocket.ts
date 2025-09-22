// import { useEffect, useState } from 'react';

// interface UseSocketReturn {
//   socket: null;
//   connected: boolean;
// }

// const useSocket = (): UseSocketReturn => {
//   const [connected, setConnected] = useState(true); // Always connected since we're using REST API

//   useEffect(() => {
//     // No Socket.IO setup needed - using REST API only
//     setConnected(true);
//   }, []);

//   return { socket: null, connected };
// };

// export default useSocket;
