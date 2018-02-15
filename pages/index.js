import React from 'react'
import { startClock, addCount, serverRenderClock } from '../store'

import AppLayout from '../layouts/AppLayout'

import Page from '../components/Page'
import withStore from '../store'

class Counter extends React.Component {
  static renderPage = ({Component, ...props}) => {
    return (
      <AppLayout title="INDEX PAGE">
        <Component {...props} />
      </AppLayout>
    )
  }

  static getInitialProps ({ store, isServer }) {
    store.dispatch(serverRenderClock(isServer))
    store.dispatch(addCount())

    return { isServer }
  }

  componentDidMount () {
    this.timer = this.props.startClock()
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  render () {
    return (
      <Page title='Index Page' linkTo='/other' />
    )
  }
}

export default withStore(Counter)
