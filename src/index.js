import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker';
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { BrowserRouter } from 'react-router-dom'
import { setContext } from 'apollo-link-context'
import { AUTH_TOKEN } from './constants'

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/'
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  let validToken = false;

  if (token) {
    //Note: If you blindly decode the payload of the token, without validating the signature, 
    //you may (or may not) run into security issues
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedToken = JSON.parse(window.atob(base64));
    let now = new Date();
    now = now.getTime() / 1000;
    const expiry = decodedToken.exp;
    
    // if the token is still valid
    if (now < expiry) {
      validToken = true;
    }
  }

  if (validToken) {
    return {
      headers: {
        ...headers,
        authorization: token ? `JWT ${token}` : ''
      }
    }
  } else {
    // if the token has expired, don't use authorization header (backend return 'Signature has expired' even in public resources)
    localStorage.removeItem(AUTH_TOKEN)
    return {
      headers: {
        ...headers
      }
    }
  }
  
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
serviceWorker.unregister();