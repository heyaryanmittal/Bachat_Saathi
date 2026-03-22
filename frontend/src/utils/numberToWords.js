export const numberToWords = (num) => {
  if (num === 0) return "Zero";
  if (!num) return "";
  
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n) => {
    if (n === 0) return "";
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + " ";
      n %= 10;
      if (n > 0) str += a[n] + " ";
    } else if (n > 0) {
      str += a[n] + " ";
    }
    return str;
  };

  let n = Math.floor(num);
  let words = "";

  if (n >= 10000000) {
    words += convertLessThanOneThousand(Math.floor(n / 10000000)) + "Crore ";
    n %= 10000000;
  }
  if (n >= 100000) {
    words += convertLessThanOneThousand(Math.floor(n / 100000)) + "Lakh ";
    n %= 100000;
  }
  if (n >= 1000) {
    words += convertLessThanOneThousand(Math.floor(n / 1000)) + "Thousand ";
    n %= 1000;
  }
  words += convertLessThanOneThousand(n);

  return words.trim() + " Rupees Only";
};
