const round2decimals = (number) => {   
    return parseFloat(number.toFixed(2))  
}

const formatBigNumber = (number) => {
    return number.toLocaleString('fr-FR')
}

export {round2decimals, formatBigNumber}