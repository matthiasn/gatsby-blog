import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'

import Header from './header'
import './layout.css'

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            subTitle
          }
        }
        allFile {
          edges {
            node {
              relativePath
              prettySize
              extension
              birthTime(fromNow: true)
            }
          }
        }
      }
    `}
    render={data => (
        <>
        <Header siteTitle={data.site.siteMetadata.title}
                subTitle={data.site.siteMetadata.subTitle}/>
        <div
          style={{
            margin: '0 auto',
            maxWidth: 960,
            padding: '0px 1.0875rem 1.45rem',
            paddingTop: 0,
            color: '#333'
          }}
        >
          {children}
          <footer>
             <iframe src="https://t0fdd8682.emailsys1a.net/183/4643/ac1ee732af/subscribe/form.html?_g=1651790792" frameborder="0" width="100%" height="550"></iframe>
              © {new Date().getFullYear()} Matthias Nehlsen
          </footer>
        </div>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
