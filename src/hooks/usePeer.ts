import Peer from "peerjs";
import { useState, useRef, useEffect } from "react";

const usePeer = () => {
  const [myPeer, setMyPeer] = useState<Peer>();
  const [myId, setMyId] = useState("");
  const isPeerSet = useRef(false);

  useEffect(() => {
    if (isPeerSet.current) return;
    isPeerSet.current = true;
    const myPeer = new Peer();
    (async function initPeer() {
      myPeer.on("open", (id) => {
        console.log(`your peer id is ${id}`);
        setMyPeer(myPeer);
        setMyId(id);
      });
    })();
  }, []);

  return {
    myPeer,
    myId,
  };
};

export default usePeer;
