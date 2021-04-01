import './App.css';

import React, {useEffect, useState } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { Button } from '@material-ui/core';
import { Switch, Route, BrowserRouter as Router, Link } from 'react-router-dom';

import SongList from './components/SongList';
import SignIn from './components/SignIn';

Amplify.configure(awsconfig);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    AssessLoggedInState();
  }, []);

  const AssessLoggedInState = () => {
    Auth.currentAuthenticatedUser()
      .then(() => {
        setLoggedIn(true);
      })
      .catch(() => {
        setLoggedIn(false);
    })
  }

  const signOut = async () => {
    try {
      await Auth.signOut();
      setLoggedIn(false);
    } catch (error) {
      console.error('error signing out', error);
    }
  }

  const onSignIn = () => {
    setLoggedIn(true);
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {
            loggedIn && <Button variant="contained" color="primary" onClick={signOut}>Sign Out</Button>
              // :
              // <Link to="/signin">
              //   <Button variant="contained" color="primary">Sign In</Button>
              // </Link>
          }
          <h2>My App Content</h2>
        </header>

        <Switch>
          {
            loggedIn ?
              <Route exact path="/">
                <SongList />
              </Route>
              : 
              <SignIn onSignIn={onSignIn} />
          }
          <Route exact path="/">
            <SignIn onSignIn={onSignIn} />
          </Route>
        </Switch>
        </div>
    </Router>
  );
}

// export default withAuthenticator(App);
export default App;

