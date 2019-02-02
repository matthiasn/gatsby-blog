import React from 'react'
import { Link, graphql } from 'gatsby'
import Layout from '../components/layout'
import Container from '../components/container'
import Helmet from 'react-helmet'
import { DiscussionEmbed } from 'disqus-react';

export default ({ data, location, pageContext }) => {
    const post = data.markdownRemark
    console.log('pageContext', pageContext)
    const { prev, next } = pageContext
    const disqusShortname = 'matthiasnehlsen';
    const disqusConfig = {
        identifier: post.id,
        title: post.frontmatter.title,
    };
    return (
    <Container>
        <Helmet
            title={post.frontmatter.title}
            meta={[
                { name: 'description', content: post.frontmatter.description },
                { name: 'keywords', content: post.frontmatter.keywords },
            ]}
        />
        <Layout>
            <div>
                <h1>{post.frontmatter.title}</h1>
                <time>{post.frontmatter.date}</time>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        {prev && (
                            <Link to={prev.fields.slug}>
                                <span>{ prev ? '← ' + prev.frontmatter.title : null} </span>
                            </Link>
                        )}
                    </div>
                    <div>
                        {next && (
                            <Link to={next.fields.slug}>
                                <span>{ next ? next.frontmatter.title + ' →' : null} </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
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
        keywords
        description
        date(formatString: "DD MMMM, YYYY")
      }
    }
  }
`
