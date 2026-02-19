def remove_lines(filepath, ranges):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # ranges is a list of tuples (start_line, end_line) 1-indexed, inclusive
    # We need to process from bottom to top to preserve indices
    ranges.sort(key=lambda x: x[0], reverse=True)
    
    for start, end in ranges:
        # Convert to 0-indexed
        # delete from start-1 to end
        del lines[start-1:end]
        print(f"Removed lines {start}-{end}")
        
    with open(filepath, 'w') as f:
        f.writelines(lines)

# Line ranges identified from view_file:
# 708-714: .coupon-area { ... }
# 1953-1955: .coupon-area { height: 50px; }
# 2196-2198: .coupon-area { height: 46px; }

ranges_to_remove = [
    (708, 714),
    (1953, 1955),
    (2196, 2198)
]

remove_lines('/Users/tolapao/Documents/GitHub/vegassweeps_777_vercel_app/assets/css/signup.css', ranges_to_remove)
