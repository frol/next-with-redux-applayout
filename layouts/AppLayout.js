import React from 'react'
import delay from '../modules/delay'
import HeaderContainer from '../containers/HeaderContainer';


class AppLayout extends React.Component {
  static async getInitialProps () {
    return {
      delay: await delay(0)
    }
  }

  render () {
    return (
      <div>
        <HeaderContainer title={this.props.title} />
        {this.props.children}
      </div>
    )
  }
}

export default AppLayout
