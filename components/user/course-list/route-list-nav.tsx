import Link from 'next/link'
import React from 'react'

const RouteListNav = () => {
  return (
    <div className='text-sm font-normal'>
      <ul className="flex list-none space-x-2">
        <li>
          <Link href="/" className="hover:text-orange-500">Home</Link>
        </li>
        <span className="text-gray-500 mx-2">{'>'}</span>
        <li>
          <Link href="/course" className="hover:text-orange-500">Course</Link>
        </li>
        <span className="text-gray-500 mx-2">{'>'}</span>
        <li>
          <span className="font-semibold text-[#ff7b34]">NEET CRASH</span>
        </li>
      </ul>
    </div>
  )
}

export default RouteListNav