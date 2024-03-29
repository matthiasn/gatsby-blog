import React from 'react'
import {Link, graphql} from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'
import Container from '../components/container'

export default ({data}) => (
    <Container>
        <Layout>
            <SEO title='Home' keywords={['flutter', 'clojure', 'clojurescript', 'github', 'software']}/>
            <p>Welcome to my blog. I'm currently mostly interested in <strong>Flutter</strong> and <strong>Clojure</strong>, with a strong focus on an open
                source application called <strong><a href={'https://github.com/matthiasn/lotti'}>Lotti</a>
                </strong>. You can find all my open source projects on my <strong><a href={'https://github.com/matthiasn'}>GitHub</a></strong> profile. Follow me to stay up to date with my latest work. I'm <strong>available</strong> for shorter or longer consulting gigs. Please do get in touch to find out more, either by email on my <strong><a href={'https://github.com/matthiasn'}>GitHub</a></strong>  profile or via <strong><a href={'https://www.linkedin.com/in/matthiasnehlsen/'}>LinkedIn</a></strong>.</p>
            <hr/>

            <div>
                {data.allMarkdownRemark.edges.map(({node}) => (
                    <div key={node.id}>
                        <Link to={node.fields.slug}>
                            <h3 style={{marginBottom: '6px', color:'#333'}}>
                                {node.frontmatter.title}
                            </h3>
                            <time>{node.frontmatter.date}</time>
                        </Link>
                        <p>{node.excerpt}</p>
                        <hr/>
                    </div>
                ))}
            </div>

        </Layout>
    </Container>

)

export const query = graphql`
  query {
    allMarkdownRemark (
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {frontmatter: { draft: { ne: true }}}
    ) {
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
