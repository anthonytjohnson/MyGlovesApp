import React, { useCallback, useState } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  TextField,
  Heading,
} from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import ChangePrice from './ChangePrice';

// GraphQL query that retrieves first 50 products
const GET_ALL_PRODUCTS = gql`{
  products(first: 50) {
    edges {
      node {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
}
`;

class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  // A constructor that defines selected items and nodes
  constructor(props) {
    super(props);
    this.state = {
      allItems: {},
    };
  }  
  render() {
    const app = this.context;
    // Returns products by ID
    return (
      <Query query={GET_ALL_PRODUCTS} variables={{ ids: store.get('ids') }}>
          {({ data, loading, error, refetch }) => { // Refetches products by ID
            if (loading) return <div>Loading…</div>;
            if (error) return <div>{error.message}</div>;
            
            const nodesById = {};
            data.products.edges.forEach(edge => nodesById[edge.id] = edge);

            return (
              <>
              <Heading>Discount your products</Heading>
                <Card>
                  <ResourceList
                    showHeader
                    resourceName={{ singular: 'Product', plural: 'Products' }}
                    items={data.products.edges}
                    renderItem={item => {
                      this.state.allItems[item.node.id] = item;
                      const [price, setPrice] = useState(item.node.variants.edges[0].node.price);
                      const handleChange = useCallback((newPrice) => {
                        if(!isNaN(Number(newPrice)))
                        {
                          item.node.variants.edges[0].node.price = newPrice;
                          setPrice(newPrice);
                        }
                      }, []);
                      
                      const media = (
                        <Thumbnail
                        source={
                          item.node.images.edges[0]
                          ? item.node.images.edges[0].node.originalSrc
                          : ''
                        }
                        alt={
                          item.node.images.edges[0]
                              ? item.node.images.edges[0].node.altText
                              : ''
                          }
                        />
                      );
                      return (
                        <ResourceList.Item
                          id={item.node.id}
                          media={media}
                          accessibilityLabel={`View details for ${item.node.title}`}
                          verticalAlignment="center"
                        >
                          <Stack alignment="center">
                            <Stack.Item fill>
                              <h3>
                                <TextStyle variation="strong">
                                  {item.node.title}
                                </TextStyle>
                              </h3>
                            </Stack.Item>
                            <Stack.Item>
                              <TextField
                                value={price}
                                label="$"
                                labelHidden="true"
                                prefix="$"
                                min="0"
                                inputMode="decimal"
                                type="currency"
                                onChange={handleChange}
                              />
                            </Stack.Item>
                          </Stack>
                        </ResourceList.Item>
                      );
                    }}
                  />
                </Card>

                <ChangePrice allItems={this.state.allItems} onUpdate={refetch} />
            </>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;

