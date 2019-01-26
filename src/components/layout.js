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
            title2
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
        <Header siteTitle={data.site.siteMetadata.title} />
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 960,
            padding: `0px 1.0875rem 1.45rem`,
            paddingTop: 0,
            color: `#333`
          }}
        >
          {children}
          <footer>
              <div id="mc_embed_signup" style={{margin: "40px 20px"}}>
                  <form
                      action="https://matthiasnehlsen.us7.list-manage.com/subscribe/post?u=798fd7b50a1d9cc58be41c2af&amp;id=eb7a7193c5"
                      method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form"
                      className="validate" target="_blank" noValidate>
                      <div id="mc_embed_signup_scroll">
                          <input type="email" name="EMAIL" className="email" id="mce-EMAIL"
                                 placeholder="email address" required
                                 style={{outline: "none"}}/>
                          <input type="submit" value="Subscribe" name="subscribe"
                                 id="mc-embedded-subscribe" className="button"/>
                          <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true">
                              <input type="text"
                                     name="b_798fd7b50a1d9cc58be41c2af_eb7a7193c5"
                                     tabIndex="-1"
                                     value=""/>
                          </div>
                      </div>
                  </form>
              </div>
              © {new Date().getFullYear()} Matthias Nehlsen
              {console.log(data)}
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
