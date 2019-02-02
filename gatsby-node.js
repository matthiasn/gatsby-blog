/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === 'MarkdownRemark') {
        const slug = createFilePath({ node, getNode, basePath: 'pages' })
        const slug2 = slug.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2})-/gi,'$1/$2/$3/');

        createNodeField({
            node,
            name: 'slug',
            value: slug2,
        })
    }
}

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions
    return graphql(`
    {
      allMarkdownRemark (sort: { fields: [frontmatter___date], order: ASC})
      {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `
    ).then(result => {
        const posts = result.data.allMarkdownRemark.edges;

        posts.forEach(({ node }, index) => {
            const prev = index === 0 ? false : posts[index - 1].node;
            const next = index === posts.length - 1 ? false : posts[index + 1].node;

            createPage({
                path: node.fields.slug,
                component: path.resolve('./src/templates/blog-post.js'),
                context: {
                    // Data passed to context is available
                    // in page queries as GraphQL variables.
                    slug: node.fields.slug,
                    next,
                    prev
                },
            })
        })
    })
};
