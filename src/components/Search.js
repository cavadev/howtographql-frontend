import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($search: String!) {
    links(search: $search) {
      id
      url
      description
      created
      postedBy {
        id
        username
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`

class Search extends Component {

  state = {
    links: [],
    search: ''
  }

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type='text'
            onChange={e => this.setState({ search: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    )
  }

  _executeSearch = async () => {
    const { search } = this.state
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { search },
    })
    const links = result.data.links
    this.setState({ links })
  }
}

export default withApollo(Search)