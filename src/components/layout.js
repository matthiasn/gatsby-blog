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
              <div id="rmOrganism">
                <div class="rmEmbed rmLayout--horizontal rmBase">
                  <div data-page-type="formSubscribe" class="rmBase__body rmSubscription">
                    <form method="post" action="https://t0fdd8682.emailsys1a.net/183/4643/ac1ee732af/subscribe/form.html?_g=1651790792" class="rmBase__content">
                      <div class="rmBase__container">
                        <div class="rmBase__section">
                          <div class="rmBase__el rmBase__el--input rmBase__el--label-pos-none" data-field="email">
                            <label for="email" class="rmBase__compLabel rmBase__compLabel--hideable">
                              Email
                            </label>
                            <div class="rmBase__compContainer">
                              <input type="text" name="email" id="email" placeholder="Email" value="" class="rmBase__comp--input comp__input" />
                              <div class="rmBase__compError"></div>
                            </div>
                          </div>
                          <div class="rmBase__el rmBase__el--cta">
                            <button type="submit" class="rmBase__comp--cta">
                              Subscribe
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div data-page-type="pageSubscribeSuccess" class="rmBase__body rmSubscription hidden">
                    <div class="rmBase__content">
                      <div class="rmBase__container">
                        <div class="rmBase__section">
                          <div class="rmBase__el rmBase__el--heading">
                            <div class="rmBase__comp--heading">
                              Thank you for subscribing!
                              <br />
                            </div>
                          </div>
                        </div>
                        <div class="rmBase__section">
                          <div class="rmBase__el rmBase__el--text">
                            <div class="rmBase__comp--text">
                              Please confirm your subscription in the confirmation email.
                              <br />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <script src="https://t0fdd8682.emailsys1a.net/form/183/5109/df45f7e7cc/embedded.js" async></script>
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
