import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Container from '../components/container'
import Helmet from 'react-helmet'

export default ({ data, location, pageContext }) => {
    const post = data.markdownRemark
    console.log("pageContext", pageContext)
    return (
    <Container>
        <Helmet
            title={post.frontmatter.title}
            meta={[
                { name: 'description', content: 'Sample' },
                { name: 'keywords', content: 'sample, something' },
            ]}
        />
        <Layout>
            <div>
                <h1>{post.frontmatter.title}</h1>
                <time>{post.frontmatter.date}</time>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <Link to={pageContext.prev}>
                        <span>{ pageContext.prev ? "← " + pageContext.prev : null} </span>
                    </Link>
                    <Link to={pageContext.next}>
                        <span>{ pageContext.next ? pageContext.next + " →" : null} </span>
                    </Link>
                </div>
            </div>
        </Layout>
    </Container>
    )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date(formatString: "DD MMMM, YYYY")
      }
    }
  }
`
