class 'RaccoonProcessor'

-- Raccoon timers
local TAILWHIP_ATTACK_MOMENT = 1
local TAILWHIP_ATTACK_WAIT = 300

-- TODO: Implement flight-ability on reaching max speed of run

function RaccoonProcessor:init(plr)
    self.tailwhip_in_process = false
    self.tailwhil_in_attack = false
    self.tailwhil_timer = 0

    local plW = (plr.plr_obj.width / 2);
    self.tail_l = plW
    self.tail_r = plW + 19
    self.tail_t = -26
    self.tail_b = -13

    -- Raocow beats 4 pixels lower
    if(plr.plr_obj.characterID == 4)then
        self.tail_t = -22
        self.tail_b = -9
    end
    -- Kood falls faster
    if(plr.plr_obj.characterID == 3)then
        self.fallSpeed = 4
    else
        self.fallSpeed = 2
    end

    self.player = plr
end

function RaccoonProcessor:loop(tickTime)
    if((self.player.plr_obj.stateID ~= 4) and (self.player.plr_obj.stateID ~= 5))then
        return
    end

    if((not self.player.plr_obj.onGround) and self.player.plr_obj:getKeyState(KEY_JUMP) )then
        if(self.player.plr_obj.speedY >= self.fallSpeed)then
            self.player.plr_obj.speedY = self.fallSpeed
            self.player.plr_obj:setAnimation(15, 128)
        end
    end

    if(self.tailwhip_in_process)then
        if(self.tailwhil_timer >= TAILWHIP_ATTACK_WAIT)then
            self.tailwhip_in_process = false
        end
        -- if(self.tailwhil_in_attack and self.tailwhil_timer >= TAILWHIP_ATTACK_MOMENT)then
        --    self.tailwhil_in_attack = false

        -- reduce width of tail hitzone with speed, use abs of self.player.plr_obj.speedX, then calculate offset:
        -- bigger speed, nearer offset

        -- spam attack zone until timeout
            self.player.plr_obj:attackArea(self.tail_l, self.tail_t, self.tail_r, self.tail_b,
                BasePlayer.AttackType_Hit,
                BaseNPC.DAMAGE_BY_KICK,
                {1, 3}
            )
        -- end
        self.tailwhil_timer = self.tailwhil_timer + tickTime
    end
end

function RaccoonProcessor:keyPress(keyType)
    if((self.player.plr_obj.stateID ~= 4) and (self.player.plr_obj.stateID ~= 5))then
        return
    end
    if( not self.tailwhip_in_process and (keyType==KEY_RUN) and (not self.player.plr_obj.isDucking) )then
        self.player.plr_obj:playAnimationOnce(18, 75, true, true, 1)
        Audio.playSoundByRole(SoundRoles.PlayerTail)
        self.tailwhip_in_process = true
        self.tailwhil_in_attack = true
        self.tailwhil_timer = 0
    end
end

return RaccoonProcessor

