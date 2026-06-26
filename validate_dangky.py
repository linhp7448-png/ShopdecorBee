def ValidateDangKy(tinChi, gpa, monNo, hocKy):
    """Kiểm tra một yêu cầu đăng ký học phần có hợp lệ hay không."""
    return (
        10 <= tinChi <= 25
        and 2.0 <= gpa <= 4.0
        and 0 <= monNo <= 3
        and 1 <= hocKy <= 10
    )
