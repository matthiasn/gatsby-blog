---
layout: post
title: "Octopress to Gatsby"
date: "2019-02-02"
comments: true
categories: 
keywords: "octropress, gatsby, blog, migration, static page generator"
description: "migrating static page generation from Octopress to Gatsby" 
---

I started my blog back in **2013** using [Octopress](http://octopress.org/) as a static site generator, generating a bunch of files that [nginx](https://nginx.org/en/) would serve efficiently and reliably. I thought that would serve me well, but it never really did, as the environment would blow up more often than not, and I would find myself chasing problems with my local [Ruby](https://www.ruby-lang.org/en/) installation, something I was never qualified for, nor have the desire to become qualified for. 

Then, trouble after trouble, I always wanted to look for a replacement, but never really found something that fit the bill, so I kept debugging and then feeling just a little turned off by the process of blogging in the process.

Ideally, my desire was to find something written in [Clojure](https://clojure.org), so at least I would have a better shot at debugging stuff. Last time I checked, probably one and a half or two years ago, there wasn't anything in Clojure that could replace Octopress, so I was excited when I found [cryogen](https://github.com/cryogen-project/cryogen) last week. But somehow, I couldn't get it to work properly when it comes to links in markdown, as some just would not be converted, for reasons I did not understand at all. I needed a replacement for Octopress though, as I just could not get it to work any more, and I have multiple posts in the pipeline that need to go out.

Then I discovered [Gatsby](https://github.com/gatsbyjs/gatsby), which is a static page generator using [React](https://reactjs.org/) and [GraphQL](https://graphql.org/). That sounded odd to me at first, since how could you respond to GraphQL queries when by definition of static pages there is no server-side service involved. That's not actually a contradiction though, as the GraphQL queries are used at build time, and in a neat and unobtrusive way at that. Here's how the template for a blog post looks like, which is a React component where the data for each post comes from the GraphQL query at the bottom:

````js
import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Container from '../components/container'
import Helmet from 'react-helmet'
import { DiscussionEmbed } from "disqus-react";

export default ({ data, location, pageContext }) => {
    const post = data.markdownRemark
    console.log("pageContext", pageContext)
    const { prev, next } = pageContext
    const disqusShortname = "matthiasnehlsen";
    const disqusConfig = {
        identifier: post.id,
        title: post.frontmatter.title,
    };
    return (
    <Container>
        <Helmet
            title={post.frontmatter.title}
            meta={[
                { name: 'description', content: 'Sample' },
                { name: 'keywords', content: 'sample, something' },
            ]}
        />
        <Layout>
            <div>
                <h1>{post.frontmatter.title}</h1>
                <time>{post.frontmatter.date}</time>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div>
                        {prev && (
                            <Link to={prev.fields.slug}>
                                <span>{ prev ? "← " + prev.frontmatter.title : null} </span>
                            </Link>
                        )}
                    </div>
                    <div>
                        {next && (
                            <Link to={next.fields.slug}>
                                <span>{ next ? next.frontmatter.title + " →" : null} </span>
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
        date(formatString: "DD MMMM, YYYY")
      }
    }
  }
`
````
[blog-post.js](https://github.com/matthiasn/gatsby-blog/blob/3049bf1d2f8d173e18f858045cab33a97421944b/src/templates/blog-post.js)

Sure, [Hiccup](https://github.com/weavejester/hiccup) looks far, far nicer than [JSX](https://reactjs.org/docs/introducing-jsx.html), but other than that, I like self-service approach to data, where the query is specified with the component, and the result then being available at render time. Then, there are the [Gatsby Node APIs], where the Markdown files are processed on startup and made available for example in the blog post template, or anywhere else. This is all that's happening there:

````js
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `MarkdownRemark`) {
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        const slug2 = slug.replace(/([0-9]{4})-([0-9]{2})-([0-9]{2})-/gi,"$1/$2/$3/");

        createNodeField({
            node,
            name: `slug`,
            value: slug2,
        })
    }
}

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions
    return graphql(`
    {
      allMarkdownRemark (sort: { fields: [frontmatter___date], order: ASC})
      {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `
    ).then(result => {
        const posts = result.data.allMarkdownRemark.edges;

        posts.forEach(({ node }, index) => {
            const prev = index === 0 ? false : posts[index - 1].node;
            const next = index === posts.length - 1 ? false : posts[index + 1].node;

            createPage({
                path: node.fields.slug,
                component: path.resolve(`./src/templates/blog-post.js`),
                context: {
                    // Data passed to context is available
                    // in page queries as GraphQL variables.
                    slug: node.fields.slug,
                    next,
                    prev
                },
            })
        })
    })
};
````
[gatsby-node.js](https://github.com/matthiasn/gatsby-blog/blob/3049bf1d2f8d173e18f858045cab33a97421944b/gatsby-node.js)

The file above is mostly from the excellent tutorial, my biggest change was to change the directory structure to match my previous Octopress blog, for `/blog/2019/02/02/octopress-to-gatsby/` instead of `/blog/2019-02-02-octopress-to-gatsby/`, and I was delighted that this seeming larger problem of path rewrites could be solved so elegantly.

The pipeline from markdown files into static pages rendered using React not only works in the build step before publication to a server, but also really nicely for updating the browser when I make changes to the markdown file, for a much better preview than a third party markdown viewer or a shaky IDE plugin, or some jumpy full browser page reload. This preview does not move the browser page at all, other than what actually changed.

Okay, this is all I want to show you here just to give you an idea of how things work. You can follow the excellent tutorials if you want to learn more. So far, my experience with **Gatsby** has been smooth and almost without glitches. And at least I work with a technology stack I am somewhat familiar with, as opposed to having to debug a Ruby development environment, of which I want to know as little as possible.

There's just one problem I ran into, and that is code highlighting for Clojure code, which is off for namespaced keywords, like in the [StatsD](/blog/2016/08/04/systemd-and-clojure/) post. Please let me know if you've fixed it somewhere in the past, or have an idea how to fix it. Also, anything else you notice, as this post is also a test run for my new site generator. 

Then next, I can get back to [meins](https://github.com/), my intelligent journal, formerly known as **meo** and written almost entirely in [Clojure](https://clojure.org) and [ClojureScript](https://clojurescript.org/). I have some interesting stuff coming up about establishing good and eliminating bad **habits**, and also how a journal can be instrumental when you write **post-mortems** about your own life, and learn from them.

Until then, Matthias