import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LinkList from './LinkList'
import CreateLink from './CreateLink'
import Header from './Header'
import Login from './Login'
import Search from './Search'

class App extends Component {
  render() {
    return (
      <div className="center w85">
        <Header />
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path='/' render={() => <Redirect to='/new' />} />
            <Route exact path="/create" component={CreateLink} />
            <Route exact path="/login" component={Login} />
            <Route exact path='/search' component={Search} />
            <Route exact path='/top' component={LinkList} />
            <Route exact path='/new' component={LinkList} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App
