class 'linkPlayer'

function linkPlayer:__init(plr_obj)
    self.plr_obj = plr_obj
    if(self.plr_obj.stateID==1)then
        self.plr_obj.health = 1
    elseif(self.plr_obj.stateID==2)then
        self.plr_obj.health = 2
    elseif(self.plr_obj.stateID>=3)then
        self.plr_obj.health = 3
    end
end

function linkPlayer:onLoop(tickTime)
    if(Settings.isDebugInfoShown())then
        Renderer.printText("Where Zelda?", 100, 430, FontType.DefaultRaster, 15, 0xFFFF0055)
        Renderer.printText("Player x: "..tostring(self.plr_obj.x), 100, 460, FontType.DefaultRaster, 15, 0xFFFF0055)
        Renderer.printText("Player y: "..tostring(self.plr_obj.y), 100, 400, FontType.DefaultRaster, 15, 0xFFFF0055)
    end
end

function linkPlayer:onHarm(harmEvent)
    processPlayerHarm(self.plr_obj, harmEvent)
end

function linkPlayer:onTakeNpc(npcObj)
    ProcessPlayerPowerUP(self.plr_obj, npcObj)
end

function linkPlayer:onKeyPressed(keyType)
    if( (keyType==KEY_RUN) )then
        if(not self.plr_obj.isDucking)then
            self.plr_obj:playAnimationOnce(27, 500, true, true, 0)
            self.plr_obj:attackArea(10, -45, 10 + 20, -45 + 10,
                BasePlayer.AttackType_Hit,
                BaseNPC.DAMAGE_BY_KICK,
                {1, 3}
            )
        else
            self.plr_obj:playAnimationOnce(30, 500, true, true, 0)
            self.plr_obj:attackArea(10, -25, 10 + 20, -25 + 10,
                BasePlayer.AttackType_Hit,
                BaseNPC.DAMAGE_BY_KICK,
                {1, 3}
            )
        end
        Audio.playSound(77)
    end
end

return linkPlayer

