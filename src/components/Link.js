import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { timeDifferenceForDate } from '../utils'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: String) {
    createVote(input: { linkId: $linkId }) {
      link {
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
      user {
        id
        username
      }
    }
  }
`

class Link extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <Mutation 
              mutation={VOTE_MUTATION} 
              variables={{ linkId: this.props.link.node.id }}
              update={(store, { data: { createVote } }) => 
                this.props.updateStoreAfterVote(store, createVote, this.props.link.node.id)
              }  
            >
              {voteMutation => (
                <div className="ml1 gray f11" onClick={voteMutation}>
                  ▲
                </div>
              )}
            </Mutation>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.node.description} ({this.props.link.node.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.node.votes.edges.length} votes | by{' '}
            {this.props.link.node.postedBy
              ? this.props.link.node.postedBy.username
              : 'Unknown'}{' '}
            {timeDifferenceForDate(this.props.link.node.created)}
          </div>
        </div>
      </div>
    )
  }
}

export default Link