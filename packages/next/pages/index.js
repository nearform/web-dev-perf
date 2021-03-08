import Head from 'next/head'
import Todo from './app/App'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>placeholder</div>
      <Todo />
    </div>
  )
}
