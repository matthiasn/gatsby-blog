import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'
import Container from '../components/container'

const IndexPage = () => (
    <Container>
        <Layout>
            <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
            <h1>Hi everyone</h1>
            <p>Welcome to my blog about software, data, and stuff. In the last couple of years, my interest has mostly been in <strong>Clojure</strong> and <strong>ClojureScript</strong>, with a strong focus on an open source application of mine called <strong><a href={"https://github.com/matthiasn/meins"}>meins</a> </strong></p>
            <p>Now go build something great.</p>
            <img src="https://source.unsplash.com/random/400x200" alt="" />
            <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
                <Image filename={"BirdWatch2.png"}/>
            </div>
            <Link to="/page-2/">Go to page 2</Link>
        </Layout>
     </Container>

)

export default IndexPage
