class 'luigiPlayer'

function luigiPlayer:__init(plr_obj)
    self.plr_obj = plr_obj
    if(self.plr_obj.stateID==1)then
        self.plr_obj.health = 1
    elseif(self.plr_obj.stateID>=2)then
        self.plr_obj.health = 2
    end
    self.raccoon = require("player/skills/raccoon")
    self.raccoon:init(self)
end

function luigiPlayer:onLoop(tickTime)
    if(Settings.isDebugInfoShown())then
        Renderer.printText("Luigi! Luigi!", 100, 430, FontType.DefaultRaster, 15, 0xFFFF0055)
        Renderer.printText("Player x: "..tostring(self.plr_obj.x), 100, 460, FontType.DefaultRaster, 15, 0xFFFF0055)
        Renderer.printText("Player y: "..tostring(self.plr_obj.y), 100, 400, FontType.DefaultRaster, 15, 0xFFFF0055)
    end
    self.raccoon:loop(tickTime)
end

function luigiPlayer:onHarm(harmEvent)
    processPlayerHarm(self.plr_obj, harmEvent)
end

function luigiPlayer:onTakeNpc(npcObj)
    ProcessPlayerPowerUP(self.plr_obj, npcObj)
end

function luigiPlayer:onKeyPressed(keyType)
    if( (self.plr_obj.stateID==3) and (keyType==KEY_RUN) and (not self.plr_obj.isDucking) )then
        self.plr_obj:playAnimationOnce(7, 128, true, false, 1)
        ShootFireball(self.plr_obj)
    end
    if( (self.plr_obj.stateID==6) and (keyType==KEY_RUN) and (not self.plr_obj.isDucking) )then
        self.plr_obj:playAnimationOnce(7, 128, true, false, 1)
        ShootHammer(self.plr_obj)
    end
    self.raccoon:keyPress(keyType)
end

return luigiPlayer

