local smbx_utils = {}

-- local SMBXFrameSpeed = 65.0
--1000.0 / SMBXFrameSpeed
-- local SMBXTickTime = 15.285
local SMBXTickTime = 15.6

function smbx_utils.ticksToTime(ticks)
    -- return ticks * SMBXTickTime
    return (ticks * 39) / 2.5;
end

function smbx_utils.speedConv(speed, timeDelay)
    return speed * ((timeDelay * 2.5) / 39.0);
end

return smbx_utils

