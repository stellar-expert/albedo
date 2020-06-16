import React from 'react'
import TimeAgo from 'react-timeago'

const timeUnits = {
    second: 's',
    minute: 'm',
    hour: 'h',
    day: 'd',
    week: 'w',
    month: 'mo',
    year: 'y'
}

function ElapsedTime({ts, className, suffix}) {
    return <span className={className}>
        <TimeAgo date={ts} formatter={(v, unit) => `${v}${timeUnits[unit]}`}/>{suffix}
    </span>
}

export default ElapsedTime