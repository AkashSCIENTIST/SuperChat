import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD29iTHtJX8LifnXg3ozQ_inUY4pdygkis",
  authDomain: "akash-super-chat.firebaseapp.com",
  projectId: "chat-app-edb92",
  storageBucket: "chat-app-edb92.appspot.com",
  messagingSenderId: "586806106961",
  appId: "1:586806106961:web:06b429f9e1a5e0a70b9170",
  measurementId: "G-7E7HYJYGHZ",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const docRef = firestore.collection("messages");

function dateString(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date +
    " " +
    month +
    " " +
    year +
    " " +
    ("0" + hour).substr(-2) +
    ":" +
    ("0" + min).substr(-2);
  return time;
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <h1>Super Chat</h1>
        {/*userPhoto && <img src={userPhoto}></img>*/}
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className='sign-in'>
      <br></br>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = React.useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limitToLast(100);
  const [messages] = useCollectionData(query, { idField: "id" });
  const obj = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = React.useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    //const inputEl = React.useRef();
    const value = formValue;
    console.log(value);
    setFormValue("");
    const { uid, photoURL, displayName } = auth.currentUser;
    //console.log(auth.currentUser);

    if (value !== "") {
      await messagesRef.add({
        text: value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
        name: displayName,
      });
    }

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottom = () => {
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy} className='dummy'></div>
      </main>
      <form onSubmit={sendMessage}>
        {/*<div>*/}
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder='Let the fun begin ...'
        />
        <button type='submit' disabled={!formValue}>
          🕊️
        </button>
        {/*</div>*/}
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, name } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  //console.log(props.message.createdAt.seconds);
  const unixTimeStamp = props.message.createdAt.seconds;
  const alternateURL = "https://api.adorable.io/avatars/23/abott@adorable.png";

  const logMessageID = () => {
    console.log(props.message.id + " deleted");
    docRef.doc(props.message.id).delete();
  };

  if (messageClass === "received") {
    return (
      <>
        <div className={`message ${messageClass}`}>
          <img src={photoURL || alternateURL} />
          <div className={`username${messageClass}`}>
            {name && <h6>{name.trim()}</h6>}
            {name && <br></br>}
            <h6>{dateString(unixTimeStamp)}</h6>
            <br></br>
            <p>{text}</p>
            <br></br>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className={`message ${messageClass}`}>
          <img
            src={
              photoURL ||
              "https://api.adorable.io/avatars/23/abott@adorable.png"
            }
          />
          <div>
            <h6>{dateString(unixTimeStamp)} </h6>
            <br></br>
            <p>{text}</p>
            {messageClass === "sent" && (
              <button onClick={logMessageID} className='deleteButton'>
                <h6>Delete</h6>
              </button>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default App;
