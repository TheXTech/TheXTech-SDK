class 'RaccoonProcessor'

-- Raccoon timers
local TAILWHIP_ATTACK_MOMENT = 50
local TAILWHIP_ATTACK_WAIT = 240

function RaccoonProcessor:init(plr)
    self.tailwhip_in_process = false
    self.tailwhil_in_attack = false
    self.tailwhil_timer = 0
    self.player = plr
end

function RaccoonProcessor:loop(tickTime)
    if(self.tailwhip_in_process)then
        if(self.tailwhil_timer >= TAILWHIP_ATTACK_WAIT)then
            self.tailwhip_in_process = false
        end
        if(self.tailwhil_in_attack and self.tailwhil_timer >= TAILWHIP_ATTACK_MOMENT)then
            self.tailwhil_in_attack = false
            self.player.plr_obj:attackArea(10, -25, 10 + 20, -25 + 10,
                BasePlayer.AttackType_Hit,
                BaseNPC.DAMAGE_BY_KICK,
                {1, 3}
            )
        end
        self.tailwhil_timer = self.tailwhil_timer + tickTime
    end
end

function RaccoonProcessor:keyPress(keyType)
    if( not self.tailwhip_in_process and (self.player.plr_obj.stateID==4 or
        self.player.plr_obj.stateID==5) and (keyType==KEY_RUN) and (not self.player.plr_obj.isDucking) )then
        self.player.plr_obj:playAnimationOnce(18, 75, true, true, 1)
        Audio.playSoundByRole(SoundRoles.PlayerTail)
        self.tailwhip_in_process = true
        self.tailwhil_in_attack = true
        self.tailwhil_timer = 0
    end
end

return RaccoonProcessor

