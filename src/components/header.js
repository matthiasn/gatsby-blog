import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'

const Header = ({ siteTitle, subTitle }) => (
  <div
    style={{
      background: `#3e6b85`,
      marginBottom: `1.45rem`,
    }}
  >
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.45rem 1.0875rem`,
      }}
    >
      <h1 style={{ margin: "0 0 6px 0" }}>
        <Link
          to="/"
          style={{
            color: "#f4921e",
            textDecoration: `none`,
          }}
        >
          {siteTitle}
        </Link>
      </h1>
      <h6 style={{color: "#c5d2db", margin: 0}}>
          {subTitle}
      </h6>
    </div>
  </div>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
