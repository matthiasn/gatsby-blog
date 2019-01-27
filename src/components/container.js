import React from "react"
import containerStyles from "./container.module.css"
import Typography from '../utils/typography'

export default ({ children }) => (
    <div>
        <div className={containerStyles.container}
             style={Typography}
        >{children}
        </div>
    </div>
)