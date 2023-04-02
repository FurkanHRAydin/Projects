///// User Authentication /////

const auth = firebase.auth();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();

/// Sign in event handlers

signInBtn.onclick = () => auth.signInWithPopup(provider);

signOutBtn.onclick = () => auth.signOut();

// Event if user is logged in or out
auth.onAuthStateChanged(user => {
  if (user) {
      // signed in
      whenSignedIn.hidden = false;
      whenSignedOut.hidden = true;
      userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
  } else {
      // not signed in
      whenSignedIn.hidden = true;
      whenSignedOut.hidden = false;
      userDetails.innerHTML = '';
  }
});

///// Firestore /////

const db = firebase.firestore();

const createPerson = document.getElementById('createPerson');
const personsList = document.getElementById('personsList');


// Reference to database location as a starting point for manipulation
let personsRef;
// Stop realtime synching. On default realtime synching is on
let unsubscribe;

auth.onAuthStateChanged(user => {
  if (user) {

      // Database Reference
      personsRef = db.collection('persons')

      const { serverTimestamp } = firebase.firestore.FieldValue;

      createPerson.onclick = () => {

          personsRef.add({
              uid: user.uid,
              name: faker.name.firstName(),
              createdAt: serverTimestamp() // new Date() would work as well
          });
      }

      // Query - returns a function to unsubscribe later on e.g. user logs out 
      unsubscribe = personsRef
                        .where('uid', '==', user.uid)
                        .orderBy('createdAt') // Requires a query
                        .onSnapshot(querySnapshot => {  // like a getter
                            
                            // Map results to an array of li elements

                            const items = querySnapshot.docs.map(doc => {

                                return `<li>${doc.data().name}</li>`

                            });

                            personsList.innerHTML = items.join('');

                        });
                }  else {
                        // Unsubscribe when the user signs out
                        unsubscribe && unsubscribe();
                        }
});