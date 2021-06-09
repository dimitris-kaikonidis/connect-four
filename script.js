//HTML elements
const modalBackground = $("#modal-background");
const modal = $("#modal-dialog");
const winMessage = $("#player-won");
const playAgainButton = $(".play-again");
const resetButton = $("#reset");
const modalCloseButton = $("#modal-dialog button");
const addColumnButton = $("#add-column");
const removeColumnButton = $("#remove-column");
const addRowButton = $("#add-row");
const removeRowButton = $("#remove-row");
const vsComputer = $(".switch");

//useful variables
let currentPlayer = "Player1";
let winCount = {
    "Player1": 0,
    "Player2": 0
};
let computerModeStatus = false;
let roundWon = false;
let keyboardIndex = 0;
let firstKeydown = true;

//initialization
hoverEffect();
clickableColumns();
keyboardableColumns();

vsComputer.on("mouseup", () => {
    reset();
    computerMode();
});
resetButton.on("mouseup", () => {
    winCount["Player1"] = 0;
    winCount["Player2"] = 0;
    $("#Player1").html("Player1 wins: 0");
    $("#Player2").html("Player2 wins: 0");
    reset();
});
playAgainButton.on("mouseup", reset);
modalCloseButton.on("mouseup", () => {
    modal.removeClass("on");
    modalBackground.removeClass("on");
});
addColumnButton.on("mouseup", () => {
    addColumn();
    reset();
});
removeColumnButton.on("mouseup", () => {
    removeColumn();
    reset();
});
addRowButton.on("mouseup", () => {
    addRow();
    reset();
});
removeRowButton.on("mouseup", () => {
    removeRow();
    reset();
});

function play(event) {
    const $currentColumn = event instanceof jQuery ? event : $(event.currentTarget);
    //find the lowest free slot
    const $slotsInColumn = $currentColumn.children();
    for (let i = $slotsInColumn.length - 1; i >= 0; i--) {
        const $currentSlot = $slotsInColumn.eq(i);
        const isFull = $currentSlot.hasClass("Player1") || $currentSlot.hasClass("Player2");
        if (!isFull) {
            $currentSlot.addClass(currentPlayer);
            $currentSlot.addClass("played");
            coinAnimation($currentSlot, currentPlayer, i + 1);
            //win checks
            //rows
            const $slotsInRow = $(`.row${i}`);
            //diagonal
            let $leftLeg = [];
            for (let j = 0; j < 4; j++) {
                $leftLeg.push($(`.column${parseInt($currentColumn.attr("class").replace(/column/g, "")) - j} > .row${i + j} `)[0]);
            }

            let $rightArm = [];
            for (let j = 0; j < 4; j++) {
                $rightArm.push($(`.column${parseInt($currentColumn.attr("class").replace(/column/g, "")) + j} > .row${i - j} `)[0]);
            }

            let $rightLeg = [];
            for (let j = 0; j < 4; j++) {
                $rightLeg.push($(`.column${parseInt($currentColumn.attr("class").replace(/column/g, "")) + j} > .row${i + j} `)[0]);
            }

            let $leftArm = [];
            for (let j = 0; j < 4; j++) {
                $leftArm.push($(`.column${parseInt($currentColumn.attr("class").replace(/column/g, "")) - j} > .row${i - j} `)[0]);
            }

            const winConditions = [
                $slotsInColumn,
                $slotsInRow,
                $rightLeg,
                $leftArm,
                $leftLeg,
                $rightArm];

            for (let winCondition of winConditions) {
                if (winCheck(winCondition, currentPlayer)) {
                    roundWon = true;
                    $(".column").off("mouseup");
                    $(document).off("keydown");
                    winCount[currentPlayer]++;
                    $(`#${currentPlayer} `).html(`${currentPlayer} wins: ${winCount[currentPlayer]} `);
                    winMessage.html(`${currentPlayer} won!`);
                    setTimeout(() => {
                        modalBackground.addClass("on");
                        modal.addClass("on");
                    }, 3000);
                }
            }
            switchPlayer();
            if (computerModeStatus && currentPlayer === "Player2" && !roundWon) {
                $(".column").off("mouseup");
                $(document).off("keydown");
                setTimeout(() => {
                    play(computerSelectColumn());
                    clickableColumns();
                    keyboardableColumns();
                }, 600);
            }
            break;
        }
    }
}

function reset() {
    $(".column").off("mouseup");
    $(".slot").removeClass("Player1 Player2 played");
    $(".slot").children().remove(".coin");
    $(".hole").empty();
    $(document).off("keydown");
    currentPlayer = "Player1";
    roundWon = false;
    keyboardIndex = 0;
    clickableColumns();
    keyboardableColumns();
}

function switchPlayer() {
    currentPlayer === "Player1" ? currentPlayer = "Player2" : currentPlayer = "Player1";
}

function winCheck(slots, currentPlayer) {
    let stringRepr = "";
    for (let slot of slots) {
        if ($(slot).hasClass("Player1")) {
            stringRepr += "1";
        } else if ($(slot).hasClass("Player2")) {
            stringRepr += "2";
        } else {
            stringRepr += "0";
        }
    }
    if (stringRepr.includes("1111") || stringRepr.includes("2222")) {
        if (Array.isArray(slots)) {
            for (let i = 0; i < slots.length; i++) {
                if ($(slots[i]).hasClass(currentPlayer)) {
                    setTimeout(() => {
                        $(slots[i]).children().append(`<div class="victory"></div>`);
                    }, 500 * i);
                }
            }
        } else {
            for (let i = 0; i < slots.children().length; i++) {
                if ($(slots[i]).hasClass(currentPlayer)) {
                    setTimeout(() => {
                        $(slots[i]).children().append(`<div class="victory"></div>`);
                    }, 500 * i);
                }
            }
        }
        return true;
    } else {
        return false;
    }
}

function addColumn() {
    if ($("#board").children().length < 12) {
        let totalRows = "";
        for (let i = 0; i < $(".column0").children().length; i++) {
            totalRows += `<div class="slot row${i}"><div class="hole"></div></div>`;
        }
        $("#board").append(`<div class="column column${$("#board").children().length}">${totalRows}</div>`);
        $(".column").off("mouseup mouseenter mouseleave");
        hoverEffect();
        clickableColumns();
    }
}

function removeColumn() {
    if ($("#board").children().length > 7) {
        $("#board").children().remove(":last-child");
    }
}

function addRow() {
    if ($(".column0").children().length < 8) {
        for (let i = 0; i < $("#board").children().length; i++) {
            $(`.column${i}`).append(`<div class="slot row${$(`.column${i}`).children().length}"><div class="hole"></div></div>`);
        }
    }
}

function removeRow() {
    if ($(".column0").children().length > 6) {
        $(".column").children().remove(":last-child");
    }
}

function hoverEffect() {
    $(".column").hover((event) => {
        $(".column").removeClass("select");
        $(event.currentTarget).children().not(".played").last().addClass("select");
    }, () => {
        $(".select").removeClass("select");
    });
}

function targetOnlyToBeSlotted(event) {
    const $currentColumn = event instanceof jQuery ? $(event) : $(event.currentTarget);
    const selectedSlotIndex = event instanceof jQuery ? event.children(".select").index() : ($(event.currentTarget).children(".select").index());
    setTimeout(() => {
        if (!selectedSlotIndex) {
            $currentColumn.children().eq(selectedSlotIndex).removeClass("select");
        } else {
            $currentColumn.children().eq(selectedSlotIndex).removeClass("select");
            $currentColumn.children().eq(selectedSlotIndex - 1).addClass("select");
        }
    }, 205);
}

function clickableColumns() {
    $(".column").on("mouseup", (event) => {
        targetOnlyToBeSlotted(event);
        play(event);
    });
}

function keyboardableColumns() {
    $(document).on("keydown", (event) => {
        switch (event.key) {
            case "ArrowLeft":
                $(".column").children().removeClass("select");
                keyboardIndex === 0 ? keyboardIndex : keyboardIndex--;
                $(`.column${keyboardIndex}`).children().not(".played").last().addClass("select");
                break;
            case "ArrowRight":
                $(".column").children().removeClass("select");
                if (firstKeydown) {
                    keyboardIndex = 0;
                    firstKeydown = false;
                } else {
                    keyboardIndex === $('#board').children().length - 1 ? keyboardIndex : keyboardIndex++;
                }
                $(`.column${keyboardIndex}`).children().not(".played").last().addClass("select");
                break;
            case " ": //space-bar
                targetOnlyToBeSlotted($($(`.column${keyboardIndex}`)));
                play($($(`.column${keyboardIndex}`)));
                break;
            case "Enter":
                targetOnlyToBeSlotted($($(`.column${keyboardIndex}`)));
                play($($(`.column${keyboardIndex}`)));
                break;
        }
    });
}

function coinAnimation(slot, player, rowNum) {
    const columnNum = $(slot[0].parentElement).attr("class").replace(/\D/g, '');
    slot.append(`<div class="coin ${player}-coin ${columnNum}${rowNum}"></div>`);
    $(`.${columnNum}${rowNum}`).css("left", `${columnNum * 100 + 10}px`);
    setTimeout(() => {
        $(`.${columnNum}${rowNum}`).css({
            "transform": `translateY(${rowNum * 100 + 10}px)`,
            "transition": "all 0.5s linear"
        });
    }, 200);
}

function computerMode() {
    computerModeStatus = !computerModeStatus;
}

function computerSelectColumn() {
    const totalColumnNum = $("#board").children().length;
    const randomColumn = Math.floor(Math.random() * totalColumnNum);
    return $("#board").children().eq(randomColumn);
}
