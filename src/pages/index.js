import React from 'react'
import {Link, graphql} from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'
import Container from '../components/container'

export default ({data}) => (
    <Container>
        <Layout>
            <SEO title="Home" keywords={[`gatsby`, `application`, `react`]}/>
            <h1>Hi everyone</h1>
            <p>Welcome to my blog about software, data, and stuff. In the last couple of years, my interest has mostly
                been in <strong>Clojure</strong> and <strong>ClojureScript</strong>, with a strong focus on an open
                source application of mine called <strong><a href={"https://github.com/matthiasn/meins"}>meins</a>
                </strong>.</p>

            <hr/>

            <div>
                {data.allMarkdownRemark.edges.map(({node}) => (
                    <div key={node.id}>
                        <Link to={node.fields.slug}>
                            <h3 style={{marginBottom: "6px", color:"#333"}}>
                                {node.frontmatter.title}
                            </h3>
                            <span style={{fontFamily: "Oswald"}}>{node.frontmatter.date}</span>
                        </Link>
                        <p>{node.excerpt}</p>
                        <hr/>
                    </div>
                ))}
            </div>

            <Link to="/page-2/">Go to page 2</Link>
        </Layout>
    </Container>

)

export const query = graphql`
  query {
    allMarkdownRemark (sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
          excerpt
          html
        }
      }
    }
  }
`
