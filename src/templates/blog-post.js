import React from 'react'
import { Link, graphql } from 'gatsby'
import Layout from '../components/layout'
import Container from '../components/container'
import Helmet from 'react-helmet'
import { DiscussionEmbed } from 'disqus-react';
import {
    FacebookShareButton,
    FacebookIcon,
    LinkedinShareButton,
    LinkedinIcon,
    TwitterShareButton,
    TwitterIcon,
    WhatsappShareButton,
    WhatsappIcon,
    RedditShareButton,
    RedditIcon,
    EmailShareButton,
    EmailIcon
} from 'react-share';

export default ({ data, location, pageContext }) => {
    const post = data.markdownRemark
    console.log('pageContext', pageContext)
    const { prev, next } = pageContext
    const disqusShortname = 'matthiasnehlsen';
    const disqusConfig = {
        identifier: post.id,
        title: post.frontmatter.title,
    };
    const url = 'https:/matthiasnehlsen.com' + pageContext.slug;
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
            <div style={{display: "flex",
                         marginTop: "20px"}}>
                <TwitterShareButton url={url}>
                    <TwitterIcon size={32} round={true} />
                </TwitterShareButton>
                <FacebookShareButton url={url}>
                    <FacebookIcon size={32} round={true} />
                </FacebookShareButton>
                <LinkedinShareButton url={url}>
                    <LinkedinIcon size={32} round={true} />
                </LinkedinShareButton>
                <RedditShareButton url={url}>
                    <RedditIcon size={32} round={true} />
                </RedditShareButton>
                <EmailShareButton url={url}>
                    <EmailIcon size={32} round={true} />
                </EmailShareButton>
            </div>
        </Layout>
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
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
