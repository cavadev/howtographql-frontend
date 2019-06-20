import React, { Component, Fragment } from 'react'
import Link from './Link'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { LINKS_PER_PAGE } from '../constants'

export const FEED_QUERY = gql`
query ($first: Int, $cursor: String, $orderBy: String) {
    links(first: $first, after: $cursor, orderBy: $orderBy) {
      totalCount
      edges {
        node {
          id
          url
          description
          created
          postedBy{
            id
            username
          }
          votes {	
            edges{
              node{
                id
                created
                user {
                  id
                  username
                }
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

class LinkList extends Component {

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({
      query: FEED_QUERY,
      variables:this._getQueryVariables()
    })
    const votedLink = data.links.edges.find(link => link.node.id === linkId)
    votedLink.node.votes = createVote.link.votes
    store.writeQuery({
       query: FEED_QUERY, 
       variables: this._getQueryVariables(),
       data 
    })
    /* 
    Sometimes no update votes in UI (only with '/top' url). The same problem using withApollo() and 
    this.props.client.writeQuery({ query: FEED_QUERY, variables: this._getQueryVariables(), data })
    Ref: https://github.com/apollographql/apollo-client/issues/2415#issuecomment-459732038
    */
  }

  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new')
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? '-created' : null
    return { first , orderBy }
  }

  _getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new')
    if (isNewPage) {
      return data.links.edges
    }
    const rankedLinks = data.links.edges.slice()
    rankedLinks.sort((l1, l2) => l2.node.votes.edges.length - l1.node.votes.edges.length)
    return rankedLinks
  }

  _updateQuery = (previousResult, { fetchMoreResult }) => {
    const newEdges = fetchMoreResult.links.edges;
    const pageInfo = fetchMoreResult.links.pageInfo;
    const totalCount = fetchMoreResult.links.totalCount;

    return newEdges.length
      ? {
          // Put the new links at the end of the list and update `pageInfo`
          // so we have the new `endCursor` and `hasNextPage` values
          links: {
            __typename: previousResult.links.__typename,
            edges: [...previousResult.links.edges, ...newEdges],
            pageInfo,
            totalCount
          }
        }
      : previousResult;
  };

  render() {
    return (
      <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
        {({ loading, error, data, fetchMore }) => {
        if (loading) return <div>Fetching</div>
        if (error) return (<div>Error: {error.toString()}</div>)
    
        let linksToRender = this._getLinksToRender(data)
        const isNewPage = this.props.location.pathname.includes('new')
    
        return (
          <Fragment>
            {linksToRender.map((link, index) => (
              <Link 
                key={link.node.id} 
                link={link} 
                index={index}
                updateStoreAfterVote={this._updateCacheAfterVote}
              />
            ))}
            {isNewPage && data.links.pageInfo.hasNextPage && (
              <div className="flex ml4 mv3 gray">
                <div 
                  className="pointer" 
                  onClick={() => 
                    fetchMore({
                      variables: {
                        cursor: data.links.pageInfo.endCursor,
                      },
                      updateQuery: this._updateQuery
                    }
                  )}
                >
                  More
                </div>
              </div>
            )}
          </Fragment>
        )
        }}
      </Query>
    )
  }
}

export default LinkList