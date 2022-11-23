#!/bin/bash


function writeHead()
{
    echo "; |------------------------------------------------------|" > $1
    echo "; |     !!!THIS IS AUTOMATICALLY CREATED FILE!!!         |" >> $1
    echo "; |   Please don't edit it. Please modify the content    |" >> $1
    echo "; |   at the \"items\" directory and run rebuild.sh        |" >> $1
    echo "; |------------------------------------------------------|" >> $1
    echo "" >> $1
}

function buildIni()
{
    srcHead=$1
    srcSection=$2
    srcItem=$3
    dstSection=$4
    dstFile=$5
    dos2unix $srcHead
    total=$(sed -nr "/^\[$srcSection\]/ { :l /^total[ ]*=/ { s/[^=]*=[ ]*//; p; q;}; n; b l;}" $srcHead)

    echo "Total $srcHead - $total"

    # Write the banner
    writeHead $dstFile

    # Write the header file
    cat $srcHead >> $dstFile
    echo "" >> $dstFile
    echo "" >> $dstFile

    # Write entries
    echo "[$total]"
    for ((i=0;i<=$total;i++)) ;
    do
        srcFilePath=$srcItem-$i.ini
        if [[ ! -f $srcFilePath ]]; then
            continue
        fi
        # Rename the section
        if grep -q "\[$dstSection\]" $srcFilePath; then
            sed -e "s/\[$dstSection\]/\[$dstSection-$i\]/g" "$srcFilePath" >> $dstFile
        else # Otherwise, append it
            echo "[$dstSection-$i]" >> $dstFile
            cat "$srcFilePath" >> $dstFile
        fi
        echo "" >> $dstFile
    done
    unix2dos $dstFile
    echo ""
}

buildIni lvl_bgo.ini        background-main     bgo/background          background  ../lvl_bgo.ini
buildIni lvl_bkgrd.ini      background2-main    backgrounds/background2 background2 ../lvl_bkgrd.ini
buildIni lvl_blocks.ini     blocks-main         blocks/block            block       ../lvl_blocks.ini
buildIni lvl_npc.ini        npc-main            npc/npc                 npc         ../lvl_npc.ini

buildIni wld_levels.ini     levels-main         levels/level            level       ../wld_levels.ini
buildIni wld_paths.ini      path-main           paths/path              path        ../wld_paths.ini
buildIni wld_scenery.ini    scenery-main        scenery/scenery         scenery     ../wld_scenery.ini
buildIni wld_tiles.ini      tiles-main          terrain/tile            tile        ../wld_tiles.ini
