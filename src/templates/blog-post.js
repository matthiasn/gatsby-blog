import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Container from '../components/container'
import Helmet from 'react-helmet'

export default ({ data }) => {
    const post = data.markdownRemark
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
