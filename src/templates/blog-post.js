import React from 'react'
import { Link, graphql } from 'gatsby'
import Layout from '../components/layout'
import Container from '../components/container'
import Helmet from 'react-helmet'
import { DiscussionEmbed } from 'disqus-react';
import {
    FacebookShareButton,
    FacebookIcon,
    GooglePlusShareButton,
    GooglePlusIcon,
    LinkedinShareButton,
    LinkedinIcon,
    TwitterShareButton,
    TwitterIcon,
    TelegramShareButton,
    TelegramIcon,
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
                <TwitterShareButton url={window.location}>
                    <TwitterIcon size={32} round={true} />
                </TwitterShareButton>
                <FacebookShareButton url={window.location}>
                    <FacebookIcon size={32} round={true} />
                </FacebookShareButton>
                <LinkedinShareButton url={window.location}>
                    <LinkedinIcon size={32} round={true} />
                </LinkedinShareButton>
                <RedditShareButton url={window.location}>
                    <RedditIcon size={32} round={true} />
                </RedditShareButton>
                <WhatsappShareButton url={window.location}>
                    <WhatsappIcon size={32} round={true} />
                </WhatsappShareButton>
                <TelegramShareButton url={window.location}>
                    <TelegramIcon size={32} round={true} />
                </TelegramShareButton>
                <EmailShareButton url={window.location}>
                    <EmailIcon size={32} round={true} />
                </EmailShareButton>
                <GooglePlusShareButton url={window.location}>
                    <GooglePlusIcon size={32} round={true} />
                </GooglePlusShareButton>
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
