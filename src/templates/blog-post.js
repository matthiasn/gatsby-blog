import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Container from '../components/container'

export default ({ data }) => {
    const post = data.markdownRemark
    return (
    <Container>
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
