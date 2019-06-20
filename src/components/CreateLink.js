import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { FEED_QUERY } from './LinkList'
import { LINKS_PER_PAGE } from '../constants'

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    createLink(input: { description: $description, url: $url }) {
      link {
        __typename
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
  }
`

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  }

  render() {
    const { description, url } = this.state
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <Mutation
          mutation={POST_MUTATION}
          variables={{ description, url }}
          onCompleted={() => this.props.history.push('/new')}
          update={(store, { data: { createLink } }) => {
            const first = LINKS_PER_PAGE
            const orderBy = '-created'
            const data = store.readQuery({
              query: FEED_QUERY,
              variables: { first, orderBy }
            })
            //I add __typename field to avoid warning 'missing field'
            let newNode = {node: createLink.link, "__typename": "LinkNodeEdge"}
            newNode.node['__typename'] = "LinkNode";
            data.links.edges.unshift(newNode)
            store.writeQuery({
              query: FEED_QUERY,
              data,
              variables: { first, orderBy }
            })
          }}
        >
          {postMutation => <button onClick={postMutation}>Submit</button>}
        </Mutation>
      </div>
    )
  }
}

export default CreateLink