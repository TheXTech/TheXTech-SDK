class 'donutPlatform'

function donutPlatform:initProps()
    self.npc_obj.gravity = 0.0
    self.isFalling = false

    self.wigglingVal = -1
    self.wigglingDelay = 28

    self.cur_wiggling_ticks = 0

    self:resetTimeout()
end

function donutPlatform:doWigle(tickTime)
    self.cur_wiggling_ticks = self.cur_wiggling_ticks - tickTime
    if(self.cur_wiggling_ticks <= 0)then
        self.npc_obj:setGfxOffsetX(self.wigglingVal)
        self.wigglingVal = self.wigglingVal * -1
        self.cur_wiggling_ticks = self.cur_wiggling_ticks + self.wigglingDelay
    end
end

function donutPlatform:resetTimeout()
    self.npc_obj:setGfxOffsetX(0.0)
    if(self.npc_obj.id == 46)then
        self.timeout = smbx_utils.ticksToTime(5)
    else
        self.timeout = smbx_utils.ticksToTime(30)
    end
end

function donutPlatform:__init(npc_obj)
    self.npc_obj = npc_obj
    self.contacts = self.npc_obj:installContactDetector()
    self:initProps()
end

function donutPlatform:onActivated()
    self:initProps()
end

function donutPlatform:onLoop(tickTime)
    local found = false
    if(self.contacts:detected())then
        local players = self.contacts:getPlayers()
        for K,Plr in pairs(players) do
            if(Plr.bottom == self.npc_obj.top or Plr.bottom <= self.npc_obj.top + 1)then
                found = true
            end
        end
    end

    if(not self.isFalling)then
        if(found)then
            self:doWigle(tickTime)
            self.timeout = self.timeout - tickTime
            if(self.timeout < 0.0)then
                self.isFalling = true
                self.npc_obj.gravity = 1.0
                self.npc_obj:setGfxOffsetX(0.0)
            end
        else
            self:resetTimeout()
        end
    end
end

return donutPlatform
